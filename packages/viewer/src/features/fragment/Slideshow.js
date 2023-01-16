import React, { useState } from "react";
import Slider from "react-slick";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Slide } from "./Slide";

export const Slideshow = ({ fragment, response, responseUpdateCallback }) => {
  let responseValue = 0;
  if (response && response.value) {
    responseValue = response.value;
  }

  const calculateStatus = (newSlideIndex) => {
    // once completed, always completed
    if (response && response.status === "completed") {
      return "completed";
    }

    if (newSlideIndex === fragment.children.length - 1) {
      return "completed";
    }

    return "in progress";
  };

  const handleSlideChange = (newSlideIndex) => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: newSlideIndex,
      status: calculateStatus(newSlideIndex),
    });
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 0,
    initialSlide: responseValue,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    afterChange: handleSlideChange,
  };

  return (
    <Paper elevation={0} sx={{ width: "90%", margin: "auto", padding: "0px" }}>
      <Slider {...settings}>
        {fragment.children.map((slideFragment) => {
          return (
            <Slide key={slideFragment.uri} fragment={slideFragment}></Slide>
          );
        })}
      </Slider>
    </Paper>
  );
};
