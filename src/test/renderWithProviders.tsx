import { ReactElement } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { render, RenderOptions } from '@testing-library/react-native';



type ProviderOptions = RenderOptions & {

  /** Wrap with navigation container (default true). */

  withNavigation?: boolean;

};



export async function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}) {

  const { withNavigation = true, ...renderOptions } = options;



  const wrapped = withNavigation ? (

    <NavigationContainer>{ui}</NavigationContainer>

  ) : (

    ui

  );



  return render(wrapped, renderOptions);

}


