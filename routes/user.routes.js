import { Router } from 'express';
import { LoginUser, LogoutUser, refreshAccessToken, RegisterUser } from '../controllers/user.js';
import { upload } from '../middlewares/multer.js'
import { auth } from '../middlewares/auth.js';
const router = Router();

router.post('/signup', upload.fields([
    {
        name: "avatar",
        maxCount: 1, // how many files will be accepted
    },
    {
        name: "coverImage",
        maxCount: 1,
    }
]), RegisterUser);

router.post('/login', LoginUser);
router.post('/logout', auth, LogoutUser);
router.post('/refresh-token', refreshAccessToken);


export default router;