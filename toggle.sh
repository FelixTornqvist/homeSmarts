#!/bin/bash

rfprogram='codesend'

if [ $2 == 'on' ]
then
  # $1 corresponds to the index of an outlet in app/outlet_settings.json
  case $1 in
    0)
      $rfprogram 1381717
      ;;
    1)
      $rfprogram 1394005
      ;;
    2)
      $rfprogram 1397077
      ;;
    3)
      $rfprogram 351491
      ;;
    4)
      $rfprogram 357635
      ;;
  esac
fi

if [ $2 == 'off' ]
then
  case $1 in
    0)
      $rfprogram 1381716
      ;;
    1)
      $rfprogram 1394004
      ;;
    2)
      $rfprogram 1397076
      ;;
    3)
      $rfprogram 351500
      ;;
    4)
      $rfprogram 357644
      ;;
  esac
fi

