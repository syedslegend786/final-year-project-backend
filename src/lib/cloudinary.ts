import { v2 as cloudinary } from "cloudinary";

export default cloudinary.config({
  cloud_name: "dbwatmerl",
  api_key: "124412169281761",
  api_secret: "d_kaLS5GhkWkdl_ly8zdRAx6-WQ",
});

export const uploadImage = async (filePath: string) => {
  return cloudinary.uploader.upload(filePath, {
    folder: "lemos",
  });
};
