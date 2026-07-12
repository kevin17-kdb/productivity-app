from fastapi import HTTPException


def internal_error(error):

    print(error)

    raise HTTPException(

        status_code=500,

        detail="Internal Server Error"

    )