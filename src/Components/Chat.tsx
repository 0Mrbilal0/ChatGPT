import {useEffect, useState} from 'react';
import {OpenAI} from "openai";
import Loading from "../assets/icons/loading.tsx";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_APP_API_KEY,
    dangerouslyAllowBrowser: true
})

export default function Chat() {
    const [question, setQuestion] = useState<string>('')
    const [response, setResponse] = useState<string>('Veuillez poser une question')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const OpenAiRequest = async (): Promise<void> => {
        console.log(question)
        setResponse('')
        setIsLoading(true)

        try {
            const streamResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: "user",
                    content: question
                }],
                max_tokens: 100,
                temperature: 0.7,
                stream: true,
            })

            for await (const chunk of streamResponse) {
                if (chunk.choices[0].delta.content === undefined) return
                if (chunk.choices[0].delta.content !== '') setIsLoading(false)
                setResponse((prev: string) => {
                    prev += chunk.choices[0].delta.content
                    return prev
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        console.log(response)
    }, [response]);

    return (
        <main className='flex flex-col h-full'>
            <div className="w-[50rem] h-full bg-gray-100 px-5 rounded-xl shadow-lg">
                <div className="flex justify-center items-center h-full">
                    <div className="text-2xl font-bold text-black">
                        {
                            isLoading
                                ? <Loading width={60} />
                                : <span>{response}</span>
                        }
                    </div>
                </div>
            </div>
            <div className={'ps-3 m-3 flex items-center gap-5 relative'}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6 absolute start-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"/>
                </svg>
                <input
                    className='bg-white border border-black w-full pl-10 py-3 pr-3 rounded-xl'
                    placeholder={'Write your question here...'}
                    type="text" onChange={(e) => setQuestion(e.currentTarget.value)}
                    onKeyUp={e => e.key === "Enter" && OpenAiRequest()}
                />
                <button
                    className='absolute end-0 me-2 hover:bg-gray-200 rounded-xl py-2 px-3 cursor-pointer'
                    onClick={OpenAiRequest}
                >
                    Ask
                </button>
            </div>
        </main>
    );
}
