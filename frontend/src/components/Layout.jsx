import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
    return (
        <div style={{ display:"flex", minHeight:"100vh" }}>
            <Sidebar />
            <main style={{ flex:1, minHeight:"100vh", overflowY:"auto", position:"relative" }}>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;