/**
 * ════════════════════════════════════════════════════════════════════════════
 * SMART CYBER CAFE — BIOMETRIC RD SERVICE HARDWARE BRIDGE
 * ════════════════════════════════════════════════════════════════════════════
 * Supports UIDAI Compliant RD Services:
 * - Mantra MFS100 (Port 11100 / 11101)
 * - Morpho MSO1300 E2/E3 (Port 11100 / 11102)
 * - Startek FM220 / SecuGen / Tatvik
 *
 * Provides instant device discovery, status probing, quality score evaluation,
 * and encrypted ISO 19794-2 biometric PID block extraction.
 */

const RD_PORTS = [11100, 11101, 11102, 11103];

export class RDServiceBridge {
  constructor() {
    this.activePort = 11100;
    this.discoveredDevice = null;
    this.isConnected = false;
  }

  /**
   * Scan localhost ports to probe connected biometric RD service drivers
   */
  async probeDevice(timeoutMs = 1500) {
    for (const port of RD_PORTS) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        // Standard UIDAI RDSERVICE discovery probe
        const response = await fetch(`http://127.0.0.1:${port}/rd/info`, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'text/xml, application/xml' }
        }).catch(() => null);

        clearTimeout(timer);

        if (response && response.ok) {
          const xmlText = await response.text();
          const info = this.parseDeviceInfoXml(xmlText);
          this.activePort = port;
          this.discoveredDevice = {
            port,
            status: info.status || 'READY',
            info: info.info || 'Biometric RD Service',
            name: this.identifyDeviceBrand(info.info || xmlText),
            rawXml: xmlText
          };
          this.isConnected = true;
          return {
            success: true,
            connected: true,
            port,
            device: this.discoveredDevice
          };
        }
      } catch (err) {
        // Port closed or not listening, continue probe
      }
    }

    // If no physical device detected on standard ports
    this.isConnected = false;
    this.discoveredDevice = null;
    return {
      success: false,
      connected: false,
      message: 'कोई बायोमेट्रिक RD सर्विस (Mantra/Morpho) कनेक्टेड नहीं मिली।'
    };
  }

  /**
   * Helper to identify device vendor brand
   */
  identifyDeviceBrand(infoStr) {
    const s = String(infoStr).toLowerCase();
    if (s.includes('mantra') || s.includes('mfs100')) return 'Mantra MFS100';
    if (s.includes('morpho') || s.includes('mso')) return 'Morpho MSO1300';
    if (s.includes('startek') || s.includes('fm220')) return 'Startek FM220';
    if (s.includes('secugen')) return 'SecuGen Hamster';
    return 'मानक UIDAI RD स्कैनर';
  }

  /**
   * Simple parser for RD info XML
   */
  parseDeviceInfoXml(xml) {
    const result = { status: 'NOTREADY', info: '' };
    try {
      const statusMatch = xml.match(/status=["']([^"']+)["']/i);
      if (statusMatch) result.status = statusMatch[1];
      const infoMatch = xml.match(/info=["']([^"']+)["']/i);
      if (infoMatch) result.info = infoMatch[1];
    } catch {}
    return result;
  }

  /**
   * Capture biometric fingerprint from active RD device
   */
  async captureFingerprint(options = {}) {
    const {
      timeout = 10000,
      env = 'P', // 'P' = Production, 'S' = Staging
      wadh = '',
      allowSimulated = false
    } = options;

    const probe = await this.probeDevice(1000);
    const port = probe.connected ? probe.port : this.activePort;

    // Standard UIDAI PidOptions XML
    const pidOptionsXml = `
      <PidOptions ver="1.0">
        <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="${timeout}" posh="UNKNOWN" env="${env}" ${wadh ? `wadh="${wadh}"` : ''} />
        <Demo></Demo>
        <CustOpts></CustOpts>
      </PidOptions>
    `.trim();

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout + 3000);

      // Execute CAPTURE command on RD driver port
      const captureUrl = `http://127.0.0.1:${port}/rd/capture`;
      const res = await fetch(captureUrl, {
        method: 'CAPTURE',
        headers: {
          'Content-Type': 'text/xml',
          'Accept': 'text/xml'
        },
        body: pidOptionsXml,
        signal: controller.signal
      }).catch(async () => {
        // Fallback to standard POST for drivers that don't support custom HTTP CAPTURE verb
        return await fetch(captureUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml',
            'Accept': 'text/xml'
          },
          body: pidOptionsXml,
          signal: controller.signal
        });
      });

      clearTimeout(timer);

      if (res && res.ok) {
        const rawXml = await res.text();
        const parsed = this.parsePidData(rawXml);
        if (parsed.errCode === '0' || parsed.errCode === 0) {
          return {
            success: true,
            qScore: parsed.qScore || 85,
            errInfo: parsed.errInfo || 'बायोमेट्रिक स्कैन सफल',
            deviceModel: this.discoveredDevice?.name || 'Mantra/Morpho RD',
            pidData: rawXml,
            timestamp: new Date().toISOString()
          };
        } else {
          return {
            success: false,
            errCode: parsed.errCode,
            error: parsed.errInfo || 'फिंगरप्रिंट स्कैन विफल हुआ। कृपया दोबारा प्रयास करें।'
          };
        }
      }
    } catch (err) {
      console.warn('[RD Service Hardware Capture Notice]:', err.message);
    }

    // Graceful Developer & Demo Simulation Mode if physical USB scanner not connected
    if (allowSimulated) {
      await new Promise(r => setTimeout(r, 1200)); // Realistic scanner latency
      const mockQScore = Math.floor(75 + Math.random() * 20); // 75% - 95% quality score
      const mockPidToken = 'MIIB+wYJKoZIhvcNAQcCoIIB7DCCAegCAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHAaCCAaAwgg' + Date.now();
      return {
        success: true,
        simulated: true,
        qScore: mockQScore,
        errInfo: 'बायोमेट्रिक स्कैन सफल (डेमो मोड / सिमुलेटेड टोकन)',
        deviceModel: 'Mantra MFS100 (सिमुलेटेड मोड)',
        pidData: `<PidData><Resp errCode="0" errInfo="Success" qScore="${mockQScore}" /><DeviceInfo mi="MFS100" /><Data type="X">${mockPidToken}</Data></PidData>`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      error: 'बायोमेट्रिक स्कैनर कनेक्ट नहीं है। कृपया USB केबल जांचें एवं Mantra/Morpho RD सर्विस चालू करें।'
    };
  }

  /**
   * Parse UIDAI PidData XML response
   */
  parsePidData(xml) {
    const res = { errCode: '-1', errInfo: 'Unknown', qScore: 0 };
    if (!xml) return res;

    const errCodeMatch = xml.match(/errCode=["']([^"']+)["']/i);
    if (errCodeMatch) res.errCode = errCodeMatch[1];

    const errInfoMatch = xml.match(/errInfo=["']([^"']+)["']/i);
    if (errInfoMatch) res.errInfo = errInfoMatch[1];

    const qScoreMatch = xml.match(/qScore=["']([^"']+)["']/i);
    if (qScoreMatch) res.qScore = parseInt(qScoreMatch[1], 10) || 0;

    return res;
  }
}

export const rdService = new RDServiceBridge();
export default rdService;
