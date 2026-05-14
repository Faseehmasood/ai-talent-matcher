// "use client"

// import { motion, AnimatePresence } from "framer-motion"
// import { useEffect, useState } from "react"

// export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
//   const [show, setShow] = useState(true)

//   useEffect(() => {
//     // 2.5 second baad hide karo
//     const timer = setTimeout(() => {
//       setShow(false)
//       setTimeout(onComplete, 600)
//     }, 2500)
//     return () => clearTimeout(timer)
//   }, [])

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.6, ease: "easeInOut" }}
//         >
//           {/* TalentaSync text — zoom out hoga */}
//           <motion.div
//             className="flex flex-col items-center gap-4"
//             initial={{ scale: 2.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
//           >
//             {/* Logo */}
//             <motion.div
//               className="w-20 h-20 rounded-3xl bg-foreground flex items-center justify-center"
//               initial={{ borderRadius: "50%" }}
//               animate={{ borderRadius: "24px" }}
//               transition={{ duration: 0.8, delay: 0.3 }}
//             >
//               <motion.span
//                 className="text-3xl font-black text-background"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.4 }}
//               >
//                 TH
//               </motion.span>
//             </motion.div>

//             {/* Brand Name */}
//             <motion.p
//               className="text-2xl font-black tracking-tighter text-foreground"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5, duration: 0.4 }}
//             >
//               TalentaSync
//             </motion.p>

//             {/* Tagline */}
//             <motion.p
//               className="text-sm text-muted-foreground font-medium tracking-widest uppercase"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.9, duration: 0.4 }}
//             >
//               AI Recruitment Platform
//             </motion.p>

//             {/* Loading bar */}
//             <motion.div
//               className="w-32 h-0.5 bg-muted rounded-full overflow-hidden mt-2"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 1, duration: 0.3 }}
//             >
//               <motion.div
//                 className="h-full bg-foreground rounded-full"
//                 initial={{ width: "0%" }}
//                 animate={{ width: "100%" }}
//                 transition={{ delay: 1.1, duration: 1.2, ease: "easeInOut" }}
//               />
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   )
// }