'use client';

import { Zap } from "lucide-react";
import { useState } from "react";
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation'
import { useMutation } from 'convex/react';
import { api } from "../../../../convex/_generated/api";
import createStripeCheckoutSession from "@/actions/createStripeCheckoutSession";

export default function UpgradeButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useUser();
    const upgradeToPro = useMutation(api.users.upgradeToPro);

    const handlePurchase = async () => {
        if (!user) return;
    
        try {
            setIsLoading(true);
            const { sessionUrl } = await createStripeCheckoutSession();

            if (sessionUrl) {
                router.push(sessionUrl);
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePurchase}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white 
                bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg 
                hover:from-blue-600 hover:to-blue-700 transition-all"
            disabled={isLoading}
        >
            <Zap className="w-5 h-5" />
            {isLoading ? 'Processing...' : 'Upgrade to Pro'}
        </button>
    );
}
