import express from 'express';
import {
    createUserFile,
    deleteMultipleFiles,
    deleteSingleFile,
    getFileTree,
    getUserFile,
    getUserIndexFile,
    updateFileTree,
} from '~/controllers/file';

const router = express.Router();

router.get('/index', getUserIndexFile);
router.post('/get', getUserFile);
router.post('/post', createUserFile); //
router.post('/delete', deleteSingleFile);
router.post('/delete_bulk', deleteMultipleFiles);
router.post('/update_tree', updateFileTree);
router.get('/get_tree/:userId', getFileTree);
export default router;
