export function Arrow({ down = false }: { down?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: down ? 'rotate(90deg)' : undefined }}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
export function Flower({ className = '' }: { className?: string }) {
  return <svg className={className} width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".8">{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="32" cy="21" rx="6" ry="14" transform={`rotate(${i * 45} 32 32)`} />)}<circle cx="32" cy="32" r="5" /></g></svg>;
}
export function SoundOn() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
export function SoundOff() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m16 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
