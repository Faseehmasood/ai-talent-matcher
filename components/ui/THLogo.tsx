// "use client"

// import { motion } from "framer-motion"

// export function THLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
//   const sizes = {
//     sm: { box: "w-8 h-8", t: "text-sm", h: "text-sm" },
//     md: { box: "w-10 h-10", t: "text-base", h: "text-base" },
//     lg: { box: "w-16 h-16", t: "text-2xl", h: "text-2xl" },
//   }

//   const s = sizes[size]

//   return (
//     <motion.div
//       className={`${s.box} relative flex items-center justify-center rounded-xl bg-foreground overflow-hidden`}
//       whileHover={{ scale: 1.05 }}
//       transition={{ type: "spring", stiffness: 400, damping: 20 }}
//     >
//       {/* T — left se aata hai */}
//       <motion.span
//         className={`${s.t} font-black text-background absolute`}
//         initial={{ x: -20, opacity: 0 }}
//         animate={{ x: -4, opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 300 }}
//       >
//         T
//       </motion.span>

//       {/* H — right se aata hai */}
//       <motion.span
//         className={`${s.h} font-black text-background absolute`}
//         initial={{ x: 20, opacity: 0 }}
//         animate={{ x: 4, opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 300 }}
//       >
//         H
//       </motion.span>
//     </motion.div>
//   )
// }