import os

UPLOAD_FOLDER = "uploads"


def get_dashboard_stats():

    total_subjects = 0
    total_pdfs = 0
    uploaded_files = []

    if not os.path.exists(UPLOAD_FOLDER):
        return {
            "subjects": 0,
            "pdfs": 0,
            "recent_uploads": []
        }

    for subject in os.listdir(UPLOAD_FOLDER):

        subject_path = os.path.join(
            UPLOAD_FOLDER,
            subject
        )

        if not os.path.isdir(subject_path):
            continue

        total_subjects += 1

        for file in os.listdir(subject_path):

            if file.lower().endswith(".pdf"):

                total_pdfs += 1

                uploaded_files.append({
                    "subject": subject,
                    "filename": file
                })

    return {

        "subjects": total_subjects,

        "pdfs": total_pdfs,

        "recent_uploads": uploaded_files[-5:]

    }