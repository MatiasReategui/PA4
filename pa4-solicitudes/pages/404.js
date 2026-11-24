import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="narrow">
      <h1>No encontramos esa página</h1>
      <p className="lead">La dirección no existe o ya no tienes acceso a ella.</p>
      <Link href="/" className="btn btn-primary">Ir al inicio</Link>
    </div>
  );
}
