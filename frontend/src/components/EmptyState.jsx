import { motion, useReducedMotion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="state-card state-card--empty">
      {Icon && (
        <motion.span
          className="state-card__icon state-card__icon--float"
          aria-hidden="true"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={24} />
        </motion.span>
      )}
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}
