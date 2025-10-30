import React, { useContext, useState } from 'react'
import bg from "../assets/image.png"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const { serverUrl,userdata, setuserdata } =useContext(userDataContext)
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
    const [loading,setloading]=useState(false)
  const [password, setPassword] = useState("")  
  const [err, setErr]=useState("")
  const handleSignup = async (e) => {
    e.preventDefault()
    setErr("")
    setloading(true)
    try {
      let result = await axios.post(`https://virt-assistant-1.onrender.com/api/auth/signup`, {
        name, email, password
      }, { withCredentials: true })
      setuserdata(result.data)
      setloading(false)
      navigate("/customize")
      
    } catch (error) {
      console.log(error)
      setuserdata(null)
      setloading(false)
      setErr(error.response.data.message)
      
    }
    
  }
  


  return (
    <div
      className='w-full h-[100vh] bg-cover flex justify-center items-center'
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className='w-[90%] h-[600px] max-w-[500px] bg-[#0000003d] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignup}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>
          Register To <span className='text-blue-400'>Personal Assistant</span>
        </h1>

        <input
          type='text'
          placeholder='Enter Your Name'
          className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
          required
          onChange={(e)=>setName(e.target.value)} value={name}
        />

        <input
          type='email'
          placeholder='Enter Your Email'
          className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
           required
          onChange={(e)=>setEmail(e.target.value)} value={email}
        />

        
        <div className='w-full h-[60px] border-2 border-white bg-transparent rounded-full text-[18px] relative flex items-center'>
          <input
            type={showPassword ? "text" : "password"}
            placeholder='Enter Password'
            className='w-full h-full bg-transparent placeholder-gray-300 px-[20px] py-[10px] text-white rounded-full outline-none'
            required
            onChange={(e)=>setPassword(e.target.value)} value={password}
          />

       
          {!showPassword ? (
            <FaEye
              onClick={() => setShowPassword(true)}
              className='absolute right-5 top-1/2 -translate-y-1/2 text-white cursor-pointer w-[25px] h-[25px]'
            />
          ) : (
           
            <FaEyeSlash
              onClick={() => setShowPassword(false)}
              className='absolute right-5 top-1/2 -translate-y-1/2 text-white cursor-pointer w-[25px] h-[25px]'
            />
          )}
        </div>
        {err.length > 0 && <p className='text-red-500 text-[17px]'>*{ err}</p>}
        <button className='min-w-[150px] mt-[30px] h-[60px] bg-white rounded-full text-[19px]'disabled={loading}>{loading ? "loading...":"Signup"}</button>
        <p className='text-[white]' >Already have an account?<span className='text-[blue]  cursor-pointer' onClick={()=>navigate("/signin")}>SignIn here</span></p>
      </form>
    </div>
  )
}

export default SignUp
