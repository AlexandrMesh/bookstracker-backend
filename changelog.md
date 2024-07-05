# Changelog

## bookdesk

## 1.5.3

###### 2024-07-05

- [New] Added validator for the `updateUserComment` endpoint

## 1.5.2

###### 2024-07-04

- [Fix] Fix for filter by categories

## 1.5.2

###### 2024-07-04

- [New] Added random recommended books to display in the Recommended board

## 1.5.0

###### 2024-06-21

- [New] Added top readers rating stat

## 1.4.22

###### 2024-06-19

- [Fix] Fix `getCountByYearV2` endpoint to return month and year for Statistic

## 1.4.21

###### 2024-06-11

- [Fix] Performance improvements for loading books
- [Fix] Fix `countByYear` method

## 1.4.2

###### 2024-06-10

- [Fix] Performance improvements for loading books

## 1.4.0

###### 2024-06-04

- [New] New api for connect to DB

## 1.3.0

###### 2024-05-27

- [New] Added `deleteUserGoalItem` endpoint

## 1.2.2

###### 2024-04-22

- [New] Added `deleteUserBookRating` endpoint

## 1.2.1

###### 2024-04-22

- [New] V2 endpoint for `booksCountByYear`

## 1.2.0

###### 2024-04-18

- [New] Goals endpoints: `userGoalItems`, `addUserGoalItem`, `addUserGoal`, `updateUserGoal`

## 1.10.0

###### 2024-01-17

- [New] Rating system for user books

## 1.9.0

###### 2024-01-17

- [New] Add `updateUserComment`, `getUserBookComment`, `deleteUserComment`

## 1.8.4

###### 2024-01-10

- [Fix] Add `added` query param to `updateUserBook` endpoint

## 1.8.3

###### 2024-01-09

- [Fix] Add `countByYear` logic into update user book endpoints

## 1.8.2

###### 2024-01-09

- [New] Added logic for saving `lastLoggedIn` value for user
- [Fix] Improvements with `Promise.all`

## 1.8.1

###### 2024-01-08

- [Fix] `getBooksCountByYear` endpoint language fixes

## 1.8.0

###### 2024-01-04

- [New] Added endpoint for updating book added value

## 1.7.0

###### 2023-11-28

- [New] Added express-validator, helmet, rate-limiter
- [Fix] Bumped up packages versions

## 1.6.0

###### 2023-11-24

- [New] Added add custom book feature

## 1.5.0

###### 2023-10-30

- [New] Added english version
- [Fix] Optimization performance

## 1.4.0

###### 2023-10-30

- [Новое] Добавлена конечная точка `GET underConstruction` для проверки проведения технических работ в приложении

## 1.3.0

###### 2023-10-24

- [Новое] Добавлена логика получения версии приложения и ссылки на Google Play приложения
- [Новое] Добавлена логика переустановки соединения если произошел разрыв или ошибка
