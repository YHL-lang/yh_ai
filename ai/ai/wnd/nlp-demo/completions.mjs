import client  from "./client.mjs";

export async function getCompletion(Prompt){
    const response =await client.chat.completions.create({
        model:process.env.DEEPSEEK_MODEL,
        messages:[
            {role:'user',content:Prompt}
        ]
    });
return response.choices[0].message.content;
}
export async function  getImage(Prompt) {
    
}