import multer from 'multer';

const storage = multer.memoryStorage(); 

// Configure file upload
export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(file.originalname.toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed.'));
        }
    },
    limits: { fileSize: 4 * 1024 * 1024 },
});

export default upload;

