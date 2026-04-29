// const express = require('express');
// const { protect } = require('../middleware/authMiddleware');
// const router = express.Router();
// const multer = require('multer');
// const upload = require('../middleware/upload'); 
// const axios = require('axios');
// const VISION_API_KEY = process.env.VISION_API_KEY;


// async function ocrImage(base64Image) {
//   const requestBody = {
//     requests: [
//       {
//         image: { content: base64Image },
//         features: [{ type: 'TEXT_DETECTION' }],
//       },
//     ],
//   };
//   const url = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
//   const { data } = await axios.post(url, requestBody);
//   const annotations = data.responses?.[0]?.textAnnotations;
//   if (!annotations || annotations.length === 0) {
//     return null; // no text found
//   }
//   return annotations[0].description;
// }

// // Clean OCR output according to pro‑tips
// function cleanOcrText(text) {
//   if (!text) return '';
//   return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
// }

// // Stub for fetching medication info – replace with real service later
// async function fetchMedicineInfo(query) {
//   // For demo purposes we just echo back the query
//   return {
//     name: query,
//     description: 'Medication details not yet integrated.',
//   };
// }

// // @desc    Scan pill image and return medication data
// // @route   POST /api/scan/pill
// // @access  Private (uses same auth middleware as other routes)
// router.post('/pill', protect, upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No image provided.' });
//     }
//     const imageBuffer = req.file.buffer || require('fs').readFileSync(req.file.path);
//     const base64Image = imageBuffer.toString('base64');
//     const rawText = await ocrImage(base64Image);
//     if (!rawText) {
//       // OCR found no text – fallback to manual search
//       return res.json({ fallback: true, message: 'No text detected.' });
//     }
//     const cleaned = cleanOcrText(rawText);
//     if (!cleaned) {
//       return res.json({ fallback: true, message: 'Unable to extract usable text.' });
//     }
//     const medInfo = await fetchMedicineInfo(cleaned);
//     return res.json({ success: true, medicine: medInfo });
//   } catch (err) {
//     console.error('Pill scan error:', err);
//     // Detect typical Vision errors (e.g., blurry image) and give user‑friendly message
//     return res.status(500).json({ message: 'Please scan clearly', error: err.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const Tesseract = require('tesseract.js');
const { protect } = require('../middleware/authMiddleware');

// ✅ Use memory storage
const upload = multer({ storage: multer.memoryStorage() });


// 🔍 OCR using Tesseract (FREE)
async function ocrImage(buffer) {
  try {
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      'eng'
    );

    return text || null;
  } catch (err) {
    console.error('OCR error:', err);
    return null;
  }
}


// 🧹 Clean text
function cleanOcrText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


// 💊 Fetch medicine info (OpenFDA)
async function fetchMedicineInfo(query) {
  try {
    const url = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`;

    const { data } = await axios.get(url);

    const result = data.results?.[0];

    return {
      name: result?.openfda?.brand_name?.[0] || query,
      description: result?.indications_and_usage?.[0] || 'No details found',
    };

  } catch (err) {
    console.log('OpenFDA fallback:', err.response?.data || err.message);

    return {
      name: query,
      description: 'No data found',
    };
  }
}


// 🚀 Main route
router.post('/pill', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided.' });
    }

    // 🔍 OCR
    const rawText = await ocrImage(req.file.buffer);

    if (!rawText) {
      return res.json({ fallback: true, message: 'No text detected' });
    }

    console.log('📄 Raw OCR:', rawText);

    // 🧹 Clean
    const cleaned = cleanOcrText(rawText);

    console.log('🧼 Cleaned:', cleaned);

    if (!cleaned) {
      return res.json({ fallback: true });
    }

    // 💊 Medicine lookup
    const medInfo = await fetchMedicineInfo(cleaned);

    return res.json({
      success: true,
      medicine: medInfo,
    });

  } catch (err) {
    console.error('Scan error:', err);
    return res.status(500).json({
      message: 'Scan failed',
      error: err.message,
    });
  }
});

module.exports = router;