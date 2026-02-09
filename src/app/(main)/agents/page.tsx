"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
    const router = useRouter();

    
    const handleAgentLoad = async () => {
        const agent = localStorage.getItem('agent_token');
        if (agent) {
            router.replace('/agents/dashboard');
        }else{
            router.replace('/agents/register');
        }
    }

    useEffect(() => {

        handleAgentLoad();

    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Agents</h1>
            <p className="text-gray-600">Manage your agents here.</p>
        </div>
    );
}