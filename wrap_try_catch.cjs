const fs = require('fs');

let p = fs.readFileSync('client/public/api/index.php', 'utf8');

const targetStart = "if ($endpoint === 'services/execute-automated' && $method === 'POST') {";
p = p.replace(targetStart, targetStart + "\n    try {");

const targetEnd = `        'order' => $newOrder
    ]);
    exit;
}`;

const replacementEnd = `        'order' => $newOrder
    ]);
    exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => 'PHP Execution Error: ' . $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);
        exit;
    }
}`;

if (p.includes(targetEnd)) {
  p = p.replace(targetEnd, replacementEnd);
  fs.writeFileSync('client/public/api/index.php', p, 'utf8');
  console.log('Wrapped execute-automated in try-catch successfully!');
} else {
  console.log('Target end not found');
}
