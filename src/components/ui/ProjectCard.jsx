'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styled, { css } from 'styled-components';
import { media } from '@/styles/theme';

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.line};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
  transition:
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease,
    box-shadow 0.5s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.violetLine};
    box-shadow: ${({ theme }) => theme.shadow.lift};
  }

  &:hover .project-media img {
    transform: scale(1.035);
  }

  &:hover .project-arrow {
    transform: translate(3px, -3px);
    color: ${({ theme }) => theme.colors.violetSoft};
  }
`;

const Media = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgRaised};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 55%, rgba(7, 7, 12, 0.55) 100%);
    pointer-events: none;
  }

  img {
    object-fit: cover;
    object-position: ${({ $position }) => $position || 'top center'};
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }

  ${({ $wide }) =>
    $wide &&
    css`
      ${media.up('md')} {
        aspect-ratio: 21 / 9;
      }
    `}
`;

const Status = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  background: rgba(7, 7, 12, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme, $pending }) =>
      $pending ? theme.colors.violetSoft : theme.colors.success};
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem 1.6rem 1.5rem;
`;

const TopLine = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const Name = styled.h3`
  font-size: clamp(1.12rem, 2vw, 1.32rem);
  letter-spacing: -0.025em;
`;

const Industry = styled.span`
  display: block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0.02em;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;

  span {
    padding: 0.3rem 0.62rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.line};
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.7rem;
    letter-spacing: 0.01em;
  }
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.lineSoft};
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const Arrow = styled.span`
  display: inline-flex;
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.3s ease;
`;

export default function ProjectCard({ project, wide = false }) {
  return (
    <Card href={`/work/${project.slug}`} $wide={wide}>
      <Media
        className="project-media"
        $wide={wide}
        $position={project.slug === 'rooteco' ? 'center' : 'top center'}
      >
        <Image
          src={wide && project.imageWide ? project.imageWide : project.image}
          alt={project.imageAlt}
          fill
          sizes={
            wide
              ? '(max-width: 900px) 100vw, 1240px'
              : '(max-width: 900px) 100vw, 50vw'
          }
        />
        <Status $pending={project.status !== 'Live'}>{project.status}</Status>
      </Media>
      <Info>
        <TopLine>
          <div>
            <Name>{project.name}</Name>
            <Industry>{project.industry}</Industry>
          </div>
        </TopLine>
        <Tags>
          {project.services.slice(0, 3).map((service) => (
            <span key={service}>{service}</span>
          ))}
        </Tags>
        <Bottom>
          <span>View project</span>
          <Arrow className="project-arrow" aria-hidden="true">
            <ArrowUpRight size={17} strokeWidth={1.9} />
          </Arrow>
        </Bottom>
      </Info>
    </Card>
  );
}
