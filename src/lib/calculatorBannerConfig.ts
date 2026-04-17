import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface BannerImage {
    url: string;
    label: string;
}

export async function getCalculatorBannerImages(): Promise<BannerImage[]> {
    const docRef = doc(db, 'config', 'calculatorBanner');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return snap.data().images || [];
    }
    // Default images if not set
    return [
        {
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
            label: 'ECONOMICA',
        },
        {
            url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&q=80&w=800',
            label: 'ESTANDAR',
        },
        {
            url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800',
            label: 'PREMIUM',
        },
    ];
}

export async function setCalculatorBannerImages(images: BannerImage[]) {
    const docRef = doc(db, 'config', 'calculatorBanner');
    await setDoc(docRef, { images });
}
