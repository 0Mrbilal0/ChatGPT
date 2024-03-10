import React, {useEffect, useState} from 'react';
import {OpenAI} from "openai";

const openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true
})


export default function Chat() {
    const [question, setQuestion] = useState<string>('')
    const [assistantId, setAssistantId] = useState<string>('')
    const [threadId, setThreadId] = useState<string>('')

    const createAssistant = async () => {
        console.log('Creating assistant')
        const assistant = await openai.beta.assistants.create({
            name: 'Experimentation Assistant',
            instructions: 'You are a baker who is trying to experiment with a new type of bread. You are trying to create a bread that is both healthy and delicious. You have a few ideas for ingredients, but you are not sure which ones to use. You want to create a bread that is high in protein, low in carbs, and has a good texture. You also want to create a bread that is easy to make and does not require a lot of time to prepare. You want to create a bread that is both healthy and delicious. You have a few ideas for ingredients, but you are not sure which ones to use. You want to create a bread that is high in protein, low in carbs, and has a good texture. You also want to create a bread that is easy to make and does not require a lot of time to prepare. You want to create a bread that is both healthy and delicious. You have a few ideas for ingredients, but you are not sure which ones to use. You want to create',
            tools: [{type: 'code_interpreter'}],
            model: 'gpt-3.5-turbo-1106'
        })
        console.log('Creating thread')
        const thread = await openai.beta.threads.create();

        console.log('Save assistant and thread id')
        setAssistantId(assistant.id as string)
        setThreadId(thread.id as string)
    }

    useEffect(() => {
        createAssistant()
    } ,[])

    const OpenAiRequest = async (question: string): Promise<void> => {
        try {
            let keepAsking = true
            while (keepAsking) {

                console.log('ne dois pas etre vide: \n',threadId,'-', assistantId)

                await openai.beta.threads.messages.create(threadId, {
                    role: 'user',
                    content: question
                })

                const run = await openai.beta.threads.runs.create(threadId, {
                    assistant_id: assistantId
                })

                let runStatus = await openai.beta.threads.runs.retrieve(
                    threadId,
                    run.id
                )

                while (runStatus.status !== "completed") {
                    await new Promise((resolve) => {
                        setTimeout(resolve,2000)
                    })
                    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id)
                }

                const messages = await openai.beta.threads.messages.list(threadId)

                const lastMessageForRun = messages.data.filter(message => message.run_id === run.id && message.role === 'assistant').pop()

                if (lastMessageForRun) {
                    console.table(`Assistant: ${JSON.stringify(lastMessageForRun.content[0])} \n`)
                }
                keepAsking = false
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleAsk = async () => {
        await OpenAiRequest(question)
    }

    return (
        <main className={'ps-3 m-3'}>
            <input type="text" onChange={(e) => setQuestion(e.currentTarget.value)}
                   onKeyUp={e => e.key === "Enter" && handleAsk()}
            />
            <button onClick={handleAsk}>Ask</button>
        </main>
    );
}
