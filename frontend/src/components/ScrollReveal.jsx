import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, width = '100%', delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
