import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CourseCard({ course, progress, onClick, isAIGenerated }) {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img src={course.image_url} alt={course.title} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-semibold">
          {course.difficulty}
        </div>
        
        {isAIGenerated && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full px-3 py-1 text-xs font-medium flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{course.lessons?.length || 0} leçons</span>
          <span className="text-sm text-gray-500">{course.duration} min</span>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {progress}% terminé
          </div>
        </div>
      </div>
    </div>
  );
}