import {
  SiReact,
  SiVuedotjs,
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiPython,
  SiGo,
  SiPostgresql,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiCloudflare,
  SiTensorflow,
  SiPytorch,
} from 'react-icons/si';
import { TbBrandOpenai } from 'react-icons/tb';
import { BsGit } from 'react-icons/bs';

export const skillCategories = [
  {
    name: '前端开发',
    icon: '🎨',
    skills: [
      { name: 'React', icon: <SiReact /> },
      { name: 'Vue', icon: <SiVuedotjs /> },
      { name: 'TypeScript', icon: <SiTypescript /> },
      { name: 'Next.js', icon: <SiNextdotjs /> },
      { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
    ],
  },
  {
    name: '后端开发',
    icon: '⚙️',
    skills: [
      { name: 'Node.js', icon: <SiNodedotjs /> },
      { name: 'Python', icon: <SiPython /> },
      { name: 'Go', icon: <SiGo /> },
      { name: 'PostgreSQL', icon: <SiPostgresql /> },
      { name: 'Redis', icon: <SiRedis /> },
    ],
  },
  {
    name: 'DevOps',
    icon: '🚀',
    skills: [
      { name: 'Docker', icon: <SiDocker /> },
      { name: 'Kubernetes', icon: <SiKubernetes /> },
      { name: 'Cloud', icon: <SiCloudflare /> },
      { name: 'Git', icon: <BsGit /> },
    ],
  },
  {
    name: 'AI / ML',
    icon: '🤖',
    skills: [
      { name: 'TensorFlow', icon: <SiTensorflow /> },
      { name: 'PyTorch', icon: <SiPytorch /> },
      { name: 'LLM', icon: <TbBrandOpenai /> },
    ],
  },
];
