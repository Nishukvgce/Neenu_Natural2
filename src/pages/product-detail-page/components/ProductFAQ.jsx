import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ProductFAQ = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    // <div className="bg-card rounded-lg border border-border p-6">
    //   <h3 className="font-heading font-semibold text-lg text-foreground mb-6">
    //     Frequently Asked Questions
    //   </h3>
    //   <div className="space-y-4">
    //     {faqs?.map((faq, index) => (
    //       <div key={index} className="border border-border rounded-lg">
    //         <button
    //           onClick={() => toggleFAQ(index)}
    //           className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors duration-200"
    //         >
    //           <span className="font-body font-medium text-foreground pr-4">
    //             {faq?.question}
    //           </span>
    //           <Icon
    //             name="ChevronDown"
    //             size={20}
    //             className={`text-muted-foreground transform transition-transform duration-200 flex-shrink-0 ${
    //               openIndex === index ? 'rotate-180' : ''
    //             }`}
    //           />
    //         </button>
            
    //         {openIndex === index && (
    //           <div className="px-4 pb-4">
    //             <div className="pt-2 border-t border-border">
    //               <p className="font-body text-muted-foreground">
    //                 {faq?.answer}
    //               </p>
    //             </div>
    //           </div>
    //         )}
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <></>
  );
};

export default ProductFAQ;