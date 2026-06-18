import AstraScreen from '../src/screens/AstraScreen/index';

// Astra es el copiloto IA de QVEX: asistente de solo lectura que no procesa
// credenciales ni ejecuta operaciones. No es una ruta financiera/Web3 sensible,
// por lo que debe estar accesible tambien en el modo estable del APK.
export default function AstraRoute() {
  return <AstraScreen />;
}
