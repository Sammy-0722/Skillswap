import { useState } from "react";
import {BrowserRouter as Router, Routes,Route} from "react-router-dom"
import Navbar from "./components/Navbar";
import Landingpage from "./components/landingpage";
import Login from "./components/Login";
import SetupProfile from "./components/SetupProfile";
import Dashboard from "./components/dashboard";
import Requests from "./components/request"
import Browser from "./components/Browse";
import Chat from "./components/Chat";
import Chats from "./components/Chats";
import EditProfile from "./components/updateProfile";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
    return(
        <Router>
        <Routes>
          <Route path='/' element={<Landingpage/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/setupprofile' element={
            <ProtectedRoute>
            <SetupProfile/>
            // </ProtectedRoute>
            }/>
          <Route path ='/dashboard' element=
            {
          <ProtectedRoute>
           <Dashboard />
          </ProtectedRoute>
          
            }/>
          <Route path="/requests" element={<Requests />} />
          <Route path="/browse" element={<Browser/>} />
          <Route path="/chat/:sessionId" element={<Chat />} />
          
          <Route path="/chats" element={<Chats />} />
          <Route path ="/edit-profile" element={<EditProfile/>}/>
        </Routes>
        </Router>
        
        
        
    )
}
export default App