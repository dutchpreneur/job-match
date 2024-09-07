const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const callOpenAIGPT = async (fileContent) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Extract the following information from this file content:\n\n${fileContent}\n\n1. Best CV ranked\n2. Strengths\n3. Weaknesses\n4. Questions that could be asked to the candidate\n` }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI GPT:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? JSON.stringify(error.response.data) : error.message);
  }
};

const extractTextFromFile = async (filePath, fileType) => {
  let fileContent = '';
  try {
    if (fileType === '.txt') {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } else if (fileType === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      fileContent = data.text;
    } else if (fileType === '.docx' || fileType === '.doc') {
      const data = await mammoth.extractRawText({ path: filePath });
      fileContent = data.value;
    } else if (['.jpeg', '.jpg', '.png'].includes(fileType)) {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      fileContent = text;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error.message);
    throw new Error('Error extracting text from file: ' + error.message);
  }
  return fileContent;
};

app.post('/upload', upload.fields([{ name: 'jobFile', maxCount: 1 }, { name: 'cvFiles', maxCount: 10 }]), async (req, res) => {
  try {
    if (req.files) {
      const jobFile = req.files.jobFile ? req.files.jobFile[0] : null;
      const cvFiles = req.files.cvFiles || [];

      let jobFileContent = '';
      if (jobFile) {
        const jobFilePath = path.join(__dirname, 'uploads', jobFile.filename);
        const jobFileType = path.extname(jobFile.originalname).toLowerCase();
        jobFileContent = await extractTextFromFile(jobFilePath, jobFileType);
      }

      const cvFileContents = await Promise.all(cvFiles.map(async (file) => {
        const cvFilePath = path.join(__dirname, 'uploads', file.filename);
        const cvFileType = path.extname(file.originalname).toLowerCase();
        return await extractTextFromFile(cvFilePath, cvFileType);
      }));

      const combinedContent = `Job Description:\n\n${jobFileContent}\n\nCVs:\n\n${cvFileContents.join('\n\n')}`;

      const gptResponse = await callOpenAIGPT(combinedContent);
      res.status(200).json({ message: 'File uploaded successfully', analysis: gptResponse });
    } else {
      throw new Error('No files received');
    }
  } catch (error) {
    console.error('Error processing files:', error.message);
    res.status(400).json({ message: 'File upload failed: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});