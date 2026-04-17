import React from 'react';
import { getCalculatorBannerImages, setCalculatorBannerImages, BannerImage } from '../lib/calculatorBannerConfig';

export const AdminBannerEditor: React.FC = () => {
    const [images, setImages] = React.useState<BannerImage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchImages = () => {
        setLoading(true);
        setError(null);
        getCalculatorBannerImages()
            .then(imgs => {
                setImages(imgs);
                setLoading(false);
            })
            .catch((e) => {
                setError('Error al cargar imágenes del banner: ' + (e?.message || e));
                setLoading(false);
            });
    };

    React.useEffect(() => {
        fetchImages();
    }, []);


    const handleChange = (idx: number, field: 'url' | 'label', value: string) => {
        setImages(imgs => imgs.map((img, i) => i === idx ? { ...img, [field]: value } : img));
    };

    // Manejar carga de archivo y convertir a base64
    const handleFileChange = (idx: number, file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setImages(imgs => imgs.map((img, i) => i === idx ? { ...img, url: base64 } : img));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await setCalculatorBannerImages(images);
        } catch (e) {
            setError('Error al guardar los cambios');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-4">Cargando imágenes del banner...</div>;

    if (error) {
        return (
            <div className="p-4">
                <div className="text-red-500 mb-2">{error}</div>
                <button
                    onClick={fetchImages}
                    className="bg-gold text-black font-bold px-6 py-2 rounded-lg mt-2 hover:bg-gold/90 transition-all"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="bg-panel p-6 rounded-xl border border-border mb-8">
            <h2 className="text-lg font-bold mb-4 text-accent">Editar imágenes del banner de tipos de obra</h2>
            {images.map((img, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                    <label className="w-48 text-xs text-white" htmlFor={`banner-file-${idx}`}>Imagen
                        <input
                            id={`banner-file-${idx}`}
                            type="file"
                            accept="image/*"
                            title="Selecciona una imagen para el banner"
                            onChange={e => handleFileChange(idx, e.target.files?.[0] || null)}
                            className="block mt-1"
                        />
                    </label>
                    <input
                        type="text"
                        value={img.label}
                        onChange={e => handleChange(idx, 'label', e.target.value)}
                        className="w-32 bg-input border border-border rounded-lg px-3 py-2 text-xs text-white"
                        placeholder="Etiqueta"
                        title="Etiqueta de la imagen"
                    />
                    <img src={img.url} alt={img.label} className="w-24 h-16 object-cover rounded border border-border" />
                </div>
            ))}
            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gold text-black font-bold px-6 py-2 rounded-lg mt-2 hover:bg-gold/90 transition-all"
            >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
};
