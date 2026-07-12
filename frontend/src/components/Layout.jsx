import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {

    return (

        <div className="flex min-h-screen bg-slate-950 text-white">

            <Sidebar />

            <main className="flex-1 min-h-screen overflow-y-auto">

                <Outlet />

            </main>

        </div>

    );

}

export default Layout;