const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

async function setup() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const envFilePath = path.join(__dirname, 'backend', '.env');

  let envFileContent = '';
  if (fs.existsSync(envFilePath)) {
    envFileContent = fs.readFileSync(envFilePath, 'utf-8');
  }

  const lines = envFileContent.split('\n');
  let mongoUriExists = false;
  const newLines = lines.map((line) => {
    if (line.startsWith('MONGO_URI=')) {
      mongoUriExists = true;
      return `MONGO_URI=${uri}`;
    }
    return line;
  });

  if (!mongoUriExists) {
    newLines.push(`MONGO_URI=${uri}`);
  }

  let jwtSecretExists = false;
  const newLinesWithJwt = newLines.map((line) => {
    if (line.startsWith('JWT_SECRET=')) {
      jwtSecretExists = true;
      return line; // Keep existing JWT_SECRET if it exists
    }
    return line;
  });

  if (!jwtSecretExists) {
    newLinesWithJwt.push('JWT_SECRET=thisisasecret');
  }

  fs.writeFileSync(envFilePath, newLinesWithJwt.join('\n'));

  console.log(`MONGO_URI set to ${uri} in backend/.env`);
  console.log('JWT_SECRET also set in backend/.env if it was not present.');
  
  // The mongod instance will stop automatically when the script exits.
  // We need to keep this script running to keep the database alive.
  // A better solution would be to integrate this into the application's lifecycle.
  // For now, we will keep the script running for 5 minutes.
  console.log('The in-memory MongoDB will be available for 5 minutes.');
  setTimeout(async () => {
    await mongod.stop();
    console.log('In-memory MongoDB stopped.');
    process.exit(0);
  }, 300000); // 5 minutes
}

setup();