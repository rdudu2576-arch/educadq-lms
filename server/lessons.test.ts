import { describe, it, expect, beforeAll } from 'vitest';
import { createLesson, createModule, getModulesByCourse } from './infra/db.js';

describe('Lesson Creation', () => {
  let courseId = 60001;
  let moduleId: number;

  beforeAll(async () => {
    // Create a module for the course
    const modules = await getModulesByCourse(courseId);
    if (modules.length === 0) {
      const newModule = await createModule({
        courseId,
        title: 'Módulo Padrão',
        order: 1,
      });
      moduleId = newModule.id;
    } else {
      moduleId = modules[0].id;
    }
  });

  it('should create a lesson successfully', async () => {
    const lessonData = {
      moduleId,
      title: 'Test Lesson',
      type: 'text' as const,
      content: 'Test content',
      order: 1,
    };

    const lesson = await createLesson(lessonData);
    
    expect(lesson).toBeDefined();
    expect(lesson.id).toBeDefined();
    expect(lesson.title).toBe('Test Lesson');
    expect(lesson.content).toBe('Test content');
    expect(lesson.moduleId).toBe(moduleId);
  });

  it('should get modules for course', async () => {
    const modules = await getModulesByCourse(courseId);
    
    expect(modules).toBeDefined();
    expect(Array.isArray(modules)).toBe(true);
    if (modules.length > 0) {
      expect(modules[0].courseId).toBe(courseId);
    }
  });
});
