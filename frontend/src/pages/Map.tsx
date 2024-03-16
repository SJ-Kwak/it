import React, { useState, useRef, useEffect } from "react";
import KakaoMap from "../components/map/KakaoMap";
import SearchBar from "../components/search/SearchBar";
import BottomSheet from "../components/bottomsheet/BottomSheet";
import styled from "styled-components";
import LocationIcon from "../assets/Location.svg";
import CloseIcon from "../assets/Close.svg";
import ResetIcon from "../assets/Reset.svg";
import SearchList from "../components/search/SearchList";
import ToCurrentIcon from '../assets/ToCurrent.svg';
import axios from "axios";
import Request from "../services/requests";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10 0px;
`;

const Title = styled.text`
  color: #191a23;
  text-align: center;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%;
  margin-bottom: 20px;
  font-family: PretendardVariable;
`;

const SearchWrapper = styled.button`
  display: flex;
  width: 327px;
  padding: 18px 16px;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  border-radius: 12px;
  background: #f8f8f8;
  border-color: transparent;
  margin-vertical: 10px;
  font-family: PretendardVariable;
`;

const Placeholder = styled.text<{ search: boolean }>`
  color: ${(props) => (props.search ? `black` : `#B4B4B4`)};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
  letter-spacing: -0.3px;
  font-family: PretendardVariable;
`;

export interface Place {
  id: number;
  building: {
    name: string;
  }
}

export interface Route {
  start: {
    latitude: number;
    longitude: number;
    building: {
      name: string;
      info: string | null;
    }
  },
  end: {
    latitude: number;
    longitude: number;
    building: {
      name: string;
      info: string | null;
    }
  },
  time: number,
  vertexList: [
    {
      latitude: number;
      longitude: number;
      building: {
        name: string;
        info: string | null;
      }
    }
  ]
}

export default function Map() {
  const request = Request();
  const [search, setSearch] = useState<string>("");
  const onChangeSearch = (e: any) => {
    e.preventDefault();
    setSearch(e.target.value);
  };
  const [mode, setMode] = useState<string>("beforeSearch");
  const [title, setTitle] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [toCurrent, setToCurrent] = useState<boolean>(false);
  const [places, setPlaces] = useState<Place[]>([{
    id: 0,
    building: {
      name: ''
    }
  }]);
  const [result, setResult] = useState<Route>({
    start: {
      latitude: 0,
      longitude: 0,
      building: {
        name: '',
        info: null
      }
    },
    end: {
      latitude: 0,
      longitude: 0,
      building: {
        name: '',
        info: null
      }
    },
    time: 0,
    vertexList: [
      {
        latitude: 0,
        longitude: 0,
        building: {
          name: '',
          info: null
        }
      }
    ]
  });

  const searchByName = async () => {
    const response = await request.get('point/find', {
      name: search
    });
    setPlaces(response.data);
  }

  useEffect(() => {
    if(search.length > 0) searchByName();
  }, [search])

  const findRoute = async () => {
    const response = await request.get('route/find', {
      start: start,
      end: end
    });
    setMode('result');
    setResult(response.data);
  }

  return (
    <>
      <img src={ToCurrentIcon} alt='현위치로' style={{position: 'absolute', zIndex: 2, bottom: 30, right: 30}} onClick={() => {setToCurrent(true); setMode('beforeSearch')}} />
      {mode === "result" && (
        <Container
          style={{
            position: "absolute",
            left: 30,
            zIndex: 2,
            alignItems: "center",
            width: "90%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div>
            <SearchWrapper
              style={{
                padding: 10,
                backgroundColor: "white",
                marginBottom: 10,
                marginTop: 20,
              }}
              onClick={() => {
                setTitle("출발지");
                setMode("onSearch");
              }}
            >
              <img src={LocationIcon} alt='현위치' />
              <Placeholder search={true}>
                출발지: {start}
              </Placeholder>
            </SearchWrapper>
            <SearchWrapper
              style={{ padding: 10, backgroundColor: "white" }}
              onClick={() => {
                setTitle("출발지");
                setMode("onSearch");
              }}
            >
              <img src={LocationIcon} alt='현위치' />
              <Placeholder search={true}>
                도착지: {end}
              </Placeholder>
            </SearchWrapper>
          </div>
          <img
            onClick={() => {
              setMode("beforeSearch");
              setSearch("");
              setStart("");
              setEnd("");
            }}
            style={{ marginTop: 20 }}
            src={ResetIcon}
            alt='닫기'
          />
        </Container>
      )}
      <KakaoMap mode={mode} result={result} toCurrent={toCurrent} />
      <BottomSheet mode={mode}>
        {mode === "onSearch" ? (
          <Container>
            <Title>{title} 검색</Title>
            <img
              onClick={() => {
                setMode("beforeSearch");
                setSearch("");
              }}
              style={{ position: "absolute", right: 30 }}
              src={CloseIcon}
              alt='닫기'
            />
            <SearchBar
              search={search}
              setSearch={setSearch}
              onChangeSearch={onChangeSearch}
            />
            {search.length > 0 && (
              <>
                <SearchList search={search} setSearch={setSearch} places={places} />
                <SearchWrapper
                  style={{
                    position: "absolute",
                    top: 630,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#00664F",
                    color: "white",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                  onClick={() => {
                    title === "출발지" ? setStart(search) : setEnd(search);
                    setSearch("");
                    setMode("beforeSearch");
                  }}
                >
                  {title}로 설정
                </SearchWrapper>
              </>
            )}
          </Container>
        ) : (
          <Container>
            <Title>어디로 가시겠어요?</Title>
            <SearchWrapper
              style={{ marginBottom: 20 }}
              onClick={() => {
                setTitle("출발지");
                setMode("onSearch");
              }}
            >
              <img src={LocationIcon} alt='현위치' />
              <Placeholder search={!!start}>
                {start ? start : "출발지"}
              </Placeholder>
            </SearchWrapper>
            <SearchWrapper
              style={{ marginBottom: 20 }}
              onClick={() => {
                setTitle("도착지");
                setMode("onSearch");
              }}
            >
              <img src={LocationIcon} alt='현위치' />
              <Placeholder search={!!end}>
                {end ? end : "도착지"}
              </Placeholder>
            </SearchWrapper>
            <SearchWrapper
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#00664F",
                color: "white",
                fontSize: 16,
                fontWeight: "700",
              }}
              onClick={findRoute}
            >
              경로 찾기
            </SearchWrapper>
          </Container>
        )}
      </BottomSheet>
    </>
  );
}
