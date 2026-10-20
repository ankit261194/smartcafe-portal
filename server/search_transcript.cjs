const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const fileStream = fs.createReadStream('C:/Users/hp/.gemini/antigravity/brain/4b49eee1-f9be-4674-852d-0c8e382e2d7d/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('1792149806636') || line.includes('1792151031391') || line.includes('API Documentation')) {
      const obj = JSON.parse(line);
      console.log('Step index:', obj.step_index, 'Source:', obj.source);
      if (obj.content) console.log('Content snippet:', obj.content.slice(0, 300));
      if (obj.thinking) {
        const urlMatches = obj.thinking.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"']*/g);
        if (urlMatches) console.log('URLs in thinking:', Array.from(new Set(urlMatches)).slice(0, 10));
      }
    }
  }
}

searchTranscript();
