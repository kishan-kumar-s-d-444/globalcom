import { useEffect } from 'react'
import ChatPage from './components/ChatPage.jsx'
import EditProfile from './components/EditProfile.jsx'
import Home from './components/Home.jsx'
import Login from './components/Login'
import MainLayout from './components/MainLayout.jsx'
import Profile from './components/Profile.jsx'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoutes><MainLayout/></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/profile/:id',
        element: <Profile />
      },
      {
        path: '/account/edit',
        element: <EditProfile />
      },
      {
        path: '/chat',
        element: <ChatPage />
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:8000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      dispatch(setSocket(socketio));

        // listen all the events
        socketio.on('getOnlineUsers', (onlineUsers) => {
          dispatch(setOnlineUsers(onlineUsers));
        });

        socketio.on('notification', (notification) => {
          dispatch(setLikeNotification(notification));
        });

        return () => {
          socketio.close();
          dispatch(setSocket(null));
        }
      } else if(socket){
        socket?.close();
        dispatch(setSocket(null));
    }
  }, [user, dispatch]);
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
