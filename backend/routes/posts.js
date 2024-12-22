import express from 'express';
import { createPost } from '../controllers/postController.js';
import multer from 'multer';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
import { uploadMedia } from '../controllers/mediaController.js'; 

const router = express.Router();

router.post('/post', upload.single('media'), async (req, res) => {
    const { user_id, title, content, privacy } = req.body;
   
    const mediaUrl = await uploadMedia(req.file);
    console.log(user_id)
    console.log(title)
    console.log(content)
    console.log(privacy)
    console.log(mediaUrl)

    try {
        const newPost = await createPost(user_id, title, content, privacy, mediaUrl);
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });
      }
});


export default router;