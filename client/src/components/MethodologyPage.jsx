'use client';

import React from 'react';
import { BookOpen, Lightbulb, Code, FileText } from 'lucide-react';
import { BlockMath } from 'react-katex';

const MethodologyPage = ({ title, description, content, formulas, examples, calculationSteps, relatedConcepts }) => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <h1 className="text-4xl font-extrabold mb-2 flex items-center">
            <BookOpen className="h-10 w-10 mr-4" />
            {title}
          </h1>
          <p className="text-blue-100 text-lg">{description}</p>
        </div>

        <div className="p-8 space-y-10">
          {/* Main Content Section */}
          {content && (
            <section className="prose prose-lg max-w-none text-gray-800">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-7 w-7 text-blue-600 mr-3" />
                Overview
              </h2>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </section>
          )}

          {/* Formulas Section */}
          {formulas && formulas.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Code className="h-7 w-7 text-purple-600 mr-3" />
                Key Formulas & Definitions
              </h2>
              <div className="space-y-8">
                {formulas.map((formula, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">{formula.name}</h3>
                    <p className="text-gray-700 mb-4">{formula.description}</p>
                    <div className="bg-white p-3 rounded border">
                      <BlockMath math={formula.latex} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Calculation Steps Section */}
          {calculationSteps && calculationSteps.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="h-7 w-7 text-green-600 mr-3" />
                Step-by-Step Calculation Walkthrough
              </h2>
              <div className="space-y-4">
                {calculationSteps.map((step, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Step {index + 1}: {step.name}</h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Examples Section */}
          {examples && examples.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="h-7 w-7 text-yellow-600 mr-3" />
                Interactive Examples
              </h2>
              <div className="space-y-8">
                {examples.map((example, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
                    <p className="text-gray-700">{example.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Concepts Section */}
          {relatedConcepts && relatedConcepts.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Concepts</h2>
              <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
                {relatedConcepts.map((concept, index) => (
                  <li key={index}>{concept}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;
