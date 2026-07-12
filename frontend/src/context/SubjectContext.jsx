import { createContext, useContext, useState } from "react";

const SubjectContext = createContext();

export function SubjectProvider({ children }) {

    const [subject, setSubject] = useState("Probability");

    return (

        <SubjectContext.Provider
            value={{
                subject,
                setSubject
            }}
        >

            {children}

        </SubjectContext.Provider>

    );

}

export function useSubject() {

    return useContext(SubjectContext);

}