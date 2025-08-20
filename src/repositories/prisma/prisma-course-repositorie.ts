import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Course } from 'prisma/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseRepository } from '../course-repositorie';
import { PrismaGenericRepository } from '../generic-repository-method';

@Injectable()
export class PrismaCourseRepository
  extends PrismaGenericRepository<Course>
  implements CourseRepository
{
  protected entityName = 'course';
  protected defaultInclude = {
    trail: true,
    modules: true,
  };
  protected prisma: PrismaService;

  constructor(prisma: PrismaService) {
    super();
    this.prisma = prisma;
  }

  async create(courseData: Prisma.courseCreateInput): Promise<Course> {
    const course = await this.prisma.course.create({
      data: courseData,
      include: this.defaultInclude,
    });

    return course as Course;
  }

  async findAll(): Promise<Course[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return courses as Course[];
  }

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return course as Course;
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return course as Course;
  }

  async findByTrailId(trailId: string): Promise<Course[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        trailId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return courses as Course[];
  }

  async update(
    id: string,
    courseData: Prisma.courseUpdateInput,
  ): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id },
      data: courseData,
      include: this.defaultInclude,
    });

    return course as Course;
  }

  async delete(id: string): Promise<Course> {
    const course = await this.prisma.course.delete({
      where: { id },
      include: this.defaultInclude,
    });

    return course as Course;
  }

  async findWithModules(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        modules: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return course as Course;
  }

  async findWithModulesAndLessons(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        modules: {
          where: {
            deletedAt: null,
          },
          include: {
            lessons: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return course as Course;
  }
}
