/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ScrollContext = createContext(undefined);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within a ScrollProvider");
  }
  return context;
};

export const ScrollProvider = ({ children }) => {
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const archiveRef = useRef(null);
  const projectRef = useRef(null);
  const [activeSection, setActiveSection] = useState("aboutRef");

  const handleScroll = (
    sectionRef = "aboutRef" | "skillsRef" | "archiveRef" | "projectRef"
  ) => {
    const refMap = {
      aboutRef,
      skillsRef,
      archiveRef,
      projectRef,
    };

    const ref = refMap[sectionRef];
    if (ref.current) {
      const yOffset = -50; // 50px offset for navbar
      const yPosition =
        ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: yPosition, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50px 0px -50% 0px" } // Adjust this rootMargin based on your navbar height and desired offset
    );

    if (aboutRef.current) observer.observe(aboutRef.current);
    if (skillsRef.current) observer.observe(skillsRef.current);
    if (archiveRef.current) observer.observe(archiveRef.current);
    if (projectRef.current) observer.observe(projectRef.current);

    return () => {
      if (aboutRef.current) observer.unobserve(aboutRef.current);
      if (skillsRef.current) observer.unobserve(skillsRef.current);
      if (archiveRef.current) observer.unobserve(archiveRef.current);
      if (projectRef.current) observer.unobserve(projectRef.current);
    };
  }, [aboutRef, skillsRef, archiveRef, projectRef]);

  return (
    <ScrollContext.Provider
      value={{
        aboutRef,
        skillsRef,
        archiveRef,
        projectRef,
        handleScroll,
        activeSection,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

{
  /* 
구성 요소 설명
ScrollContext 정의:

ScrollContext는 createContext를 사용하여 생성됩니다. 초기 값은 undefined로 설정되어 있으며, 이 값은 Provider를 통해 제공됩니다.
ScrollContextProps 인터페이스:

이 인터페이스는 ScrollContext가 제공하는 값의 구조를 정의합니다. 여기에는 각 섹션의 참조(aboutRef, skillsRef, archiveRef), 스크롤 핸들러 함수(handleScroll), 그리고 현재 활성화된 섹션(activeSection)이 포함됩니다.
useScrollContext 훅:

이 훅은 useContext를 사용하여 ScrollContext에 접근합니다. 만약 ScrollContext가 제공되지 않은 상태에서 호출된다면 에러를 던집니다. 이는 컴포넌트가 항상 ScrollProvider 내부에서 사용되도록 보장합니다.
ScrollProvider 컴포넌트:

이 컴포넌트는 ScrollContext.Provider를 사용하여 자식 컴포넌트들에게 ScrollContext의 값을 제공합니다.
Refs 설정: useRef를 사용하여 각 섹션에 대한 참조를 생성합니다.
activeSection 상태 관리: useState를 사용하여 현재 활성화된 섹션을 관리합니다.
handleScroll 함수: 특정 섹션으로 스크롤하기 위한 함수입니다. 각 섹션의 참조를 기반으로 스크롤 위치를 계산하고 이동합니다.
useEffect를 사용한 IntersectionObserver 설정: useEffect를 사용하여 IntersectionObserver를 설정합니다. 이 옵저버는 섹션이 뷰포트에 들어오면 activeSection 상태를 업데이트합니다. 옵저버의 rootMargin 옵션을 사용하여 섹션의 가시성을 조정합니다.
IntersectionObserver 설정 및 해제:

섹션이 뷰포트에 들어오거나 나갈 때를 감지하여 activeSection 상태를 업데이트합니다.
useEffect의 반환 값으로 observer를 해제하는 클린업 함수를 반환하여 컴포넌트가 언마운트될 때 옵저버를 해제합니다.
*/
}
