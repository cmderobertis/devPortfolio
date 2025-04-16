import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const projects = [
  {
    title: 'Project 1',
    description: 'A short description of Project 1.',
    images: [
      'https://source.unsplash.com/random/800x600?sig=1',
      'https://source.unsplash.com/random/800x600?sig=2',
      'https://source.unsplash.com/random/800x600?sig=3',
    ],
  },
  {
    title: 'Project 2',
    description: 'A short description of Project 2.',
    images: [
      'https://source.unsplash.com/random/800x600?sig=4',
      'https://source.unsplash.com/random/800x600?sig=5',
      'https://source.unsplash.com/random/800x600?sig=6',
    ],
  },
  {
    title: 'Project 3',
    description: 'A short description of Project 3.',
    images: [
      'https://source.unsplash.com/random/800x600?sig=7',
      'https://source.unsplash.com/random/800x600?sig=8',
      'https://source.unsplash.com/random/800x600?sig=9',
    ],
  },
];

const ProjectCarousel = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Slider {...settings}>
      {images.map((image, index) => (
        <div key={index}>
          <img src={image} alt={`Slide ${index + 1}`} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      ))}
    </Slider>
  );
};

const Projects = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">My Projects</h1>
      {projects.map((project, index) => (
        <div key={index} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{project.title}</h2>
          <ProjectCarousel images={project.images} />
          <p className="mt-4">{project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Projects;