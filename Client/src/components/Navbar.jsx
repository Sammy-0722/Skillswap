import "./Navbar.css";
function Navbar(){
    return(
        <>
        <div className="container">
            <div className="Logo">Skill<span>Swap</span></div>
            <div className="navbtns">
                <div className="logutdiv">Log Out</div>
                <div className="signupdiv"> Sign UP</div>
            </div>
        </div>
        </>
    )
}
export default Navbar;