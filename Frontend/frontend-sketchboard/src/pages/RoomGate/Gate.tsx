/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import Input from '../../components/ui/CustomInput'
import slider_image_1 from "../../assets/gate_image_1.png"
import slider_image_2 from "../../assets/gate_image_2.png"
import slider_image_3 from "../../assets/gate_image_3.png"
import HeroSlider from '../../components/ui/ImageSlider'
import { useNavigate } from "react-router-dom";
import { createRoom } from '../../service/room.service'
// import { FiCopy, FiEdit2, FiMoreVertical, FiPlus, FiTrash2 } from 'react-icons/fi'
import MenuDropdown from '../../components/ui/UserMenu'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import { FiPlus } from 'react-icons/fi'


function Gate() {
    const [joinCode, setJoinCode] = useState("")
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const slides: any = [
        {
            image: slider_image_1,
            title: "Ideate. Sketch. Collaborate.",
            description:
                "Create a board and invite others to bring ideas to life—together, in real-time.",
        },
        {
            image: slider_image_2,
            title: "Brainstorm Freely",
            description:
                "Organize ideas visually and collaborate seamlessly with your team.",
        },
        {
            image: slider_image_3,
            title: "Work Together",
            description:
                "Share feedback instantly and build projects collaboratively.",
        },
    ];

    const startInstantMeetingHandler = async () => {
        try {
            setLoading(true);

            const response = await createRoom();

            console.log(response);

            console.log("its working...")

            navigate(`/room/${response.data.roomId}`);

        } catch (error) {
            console.error("Room creation failed:", error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className=' flex h-[100%] '>
            <div className=' flex-1 flex justify-center items-center'>

                <div className='max-w-[500px] flex flex-col  gap-y-8'>

                    <div className='flex flex-col gap-y-6'>
                        <div className='text-[35px]'>
                            <h1>Visualize ideas.</h1>
                            <h1>Together, in real-time.</h1>
                        </div>
                        <p className='text-[#bfc0c5] max-w-[300px]'>Sketch, brainstorm and collaborate on a limitless canvas with your team</p>
                    </div>
                    <div className='flex justify-center items-center gap-x-6'>
                        <Input
                            name="name"
                            placeholder="Enter a code or link"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className='w-fill'
                        />
                        <span className='border border-[#bfc0c5] h-[30px]'></span>
                        <button className=''>Join</button>
                    </div>
                    <div>

                        <MenuDropdown
                            variant="primary"
                            triggerText="Create a board"
                            triggerIcon={<Copy size={16} />}
                            iconPosition="left"
                            title="Quick Actions"
                            loading={loading}
                            items={[
                                {
                                    label: "Start an instant meeting",
                                    icon: <FiPlus size={16} />,
                                    onClick: () => startInstantMeetingHandler(),
                                }
                            ]}
                        />
                    </div>
                    <span className='border border-[#bfc0c5]'></span>
                    <div className='text-[#3d48dd]'>
                        Learn more about Nexora
                    </div >
                </div>
            </div>


            <div className='flex-1 flex justify-center items-center'>
                <div className=' '>
                    <HeroSlider slides={slides} />

                </div>

            </div>
        </div>
    )
}

export default Gate