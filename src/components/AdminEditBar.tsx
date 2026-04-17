
import React from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import './AdminEditBar.css';

/**
 * Barra flotante de edición para el modo administrador.
 * Permite cambiar colores, imágenes, textos y activar herramientas de edición visual.
 */
interface AdminEditBarProps {
    onOpenPalette?: () => void;
    onOpenImages?: () => void;
    onOpenTexts?: () => void;
    onOpenEffects?: () => void;
    onSave?: () => void;
}

export const AdminEditBar: React.FC<AdminEditBarProps> = ({ onOpenPalette, onOpenImages, onOpenTexts, onOpenEffects, onSave }) => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'admin-edit-bar',
    });

    const style: React.CSSProperties = {
        position: 'fixed',
        left: position.x + (transform?.x || 0),
        top: position.y + (transform?.y || 0),
        zIndex: 9999,
        touchAction: 'none',
    };

    // Actualizar la posición final al soltar
    const handleDragEnd = (event: any) => {
        setPosition(pos => ({
            x: pos.x + (event.delta?.x || 0),
            y: pos.y + (event.delta?.y || 0),
        }));
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div ref={setNodeRef} style={style} className="admin-edit-bar">
                <div className="admin-edit-bar-title" style={{ cursor: 'move' }} {...listeners} {...attributes}>Panel de Edición</div>
                <button onClick={onOpenPalette} className="admin-edit-bar-btn">Paleta de Colores</button>
                <button onClick={onOpenImages} className="admin-edit-bar-btn">Imágenes</button>
                <button onClick={onOpenTexts} className="admin-edit-bar-btn">Textos</button>
                <button onClick={onOpenEffects} className="admin-edit-bar-btn">Efectos Visuales</button>
                <button onClick={onSave} className="admin-edit-bar-btn save">Guardar Cambios</button>
            </div>
        </DndContext>
    );
};
