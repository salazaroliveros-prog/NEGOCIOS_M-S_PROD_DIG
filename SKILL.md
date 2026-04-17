# Skill: Debugging React/Vite + Firebase Apps (React 19+)

## Purpose
A step-by-step workflow for depuración y solución de errores en aplicaciones React modernas (React 19+, Vite, Firebase, librerías de terceros) con enfoque en incompatibilidades, errores de sintaxis, y migraciones de dependencias.

## Workflow
1. **Identificación del error**
   - Lee el mensaje de error completo (consola navegador y terminal).
   - Determina si es de sintaxis, runtime, dependencias o incompatibilidad de librerías.

2. **Revisión de sintaxis y estructura**
   - Revisa el archivo fuente reportado por el error.
   - Busca llaves, paréntesis, imports y exports mal escritos.
   - Usa herramientas de lint y get_errors para validar.

3. **Verificación de dependencias**
   - Revisa package.json para versiones de React, react-dom y librerías relacionadas.
   - Busca incompatibilidades conocidas (ejemplo: react-draggable y React 19).
   - Si una librería usa APIs obsoletas, busca alternativas modernas.

4. **Migración de librerías incompatibles**
   - Identifica el uso de APIs eliminadas (findDOMNode, etc).
   - Sustituye por librerías compatibles (ejemplo: @dnd-kit/core para drag & drop).
   - Refactoriza el componente para usar la nueva API.

5. **Validación y pruebas**
   - Corre npm run dev y verifica que el error desaparezca.
   - Revisa la funcionalidad visual y lógica del componente migrado.
   - Si persisten errores, repite desde el paso 1.

## Quality Criteria
- El error original desaparece y la app inicia sin errores críticos.
- El componente migrado mantiene su funcionalidad.
- No se introducen regresiones visuales o de UX.
- El código es compatible con React 19+ y Vite 8+.

## Example Prompts
- "Tengo un error de findDOMNode con react-draggable en React 19, ¿cómo lo soluciono?"
- "¿Cómo migro un componente draggable a @dnd-kit/core?"
- "¿Por qué mi app Vite+React 19 lanza error 500 tras actualizar dependencias?"

## Related Customizations
- Skill para migración de hooks obsoletos.
- Skill para revisión de breaking changes en upgrades de React.
- Skill para debugging de integración Firebase + React.
