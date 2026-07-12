import { useDropzone } from "react-dropzone";

function UploadZone({ onDrop }) {

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"]
    },
    onDrop
  });

  return (

    <div
      {...getRootProps()}
      className="border-2 border-dashed border-blue-500 rounded-xl p-16 text-center cursor-pointer hover:bg-slate-800"
    >

      <input {...getInputProps()} />

      <h2 className="text-2xl">
        📄 Drag & Drop PDF Here
      </h2>

      <p className="text-gray-400 mt-3">
        or click to browse
      </p>

    </div>

  );

}

export default UploadZone;