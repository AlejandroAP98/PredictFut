export default function SkillIcon({ icon: Icon, size = 20, className }) {
  if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && Icon.$$typeof)) {
    return <Icon size={size} className={className} />
  }
  return <span className={className} style={{ fontSize: size }}>{Icon}</span>
}