import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp");
    },
    filename: (req, file, cb) => {
        let fileExtension = "";
        if (file.originalname.split(".").length > 1){
            fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
        }

        const fileName = file.originalname
            .toLowerCase()
            .split(" ")
            .join("-")
            ?.split(".")[0];

        cb(
            null,
            fileName + Date.now() + Math.ceil(Math.random() * 1e5) + fileExtension
        );
    }
})

// Use this upload instance as the middleware to upload file to the local storage
export const upload = multer({ storage: storage });