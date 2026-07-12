import { exportToPDF } from "../utils/pdfExport";

function DownloadButton({

    title,

    content

}) {

    return (

        <button

            onClick={() =>

                exportToPDF(

                    title,

                    content

                )

            }

            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl"

        >

            📄 Download PDF

        </button>

    );

}

export default DownloadButton;